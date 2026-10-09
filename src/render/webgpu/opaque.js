import { surveyProgram } from './surveyMaterial.js';
import { InstanceCuller } from './culling.js';
import * as THREE from 'three';
import { bufferWithData, shaderModule } from './device.js';
import { ProgramBindings } from './program.js';
import { shaderKey } from './uniforms.js';
import { tuning } from './tuning.js';
import { opaquePrograms } from './generated/opaque.js';
export const GBUFFER_FORMATS = ['rgba8unorm','rgba16float','rgba16float','rgba8unorm'];
import { attribute, fields, cachedFields, layouts, pack, version } from './geometry.js';
const FAMILY={rock:1,flora:2,grass:3,survey:4,floe:6,iceblock:6,giant:7};
const disabledShadows={uSunShadow:{value:null},uSkyShadow:{value:null},uGrassCover:{value:null},uTrunkSky:{value:null},uRockSky:{value:null},tShadowAtlas:{value:null},tSkyRings:{value:null}};
export class OpaquePass {
 constructor(device,textures,descriptors=[...opaquePrograms,surveyProgram]){this.culler=new InstanceCuller(device);this.descriptors=descriptors;this.uniformOverrides=disabledShadows;this.device=device;this.textures=textures;this.programs=new Map();this.materialKeys=new WeakMap();this.meshes=new Map();this.geometryCache=new Map();this.white=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);this.white.needsUpdate=true;}
 async init(){await this.culler.init();await Promise.all(this.descriptors.map(async p=>{
  const vertexBindings=new ProgramBindings(this.device,p.vertex.layout,this.textures,GPUShaderStage.VERTEX),fragmentBindings=new ProgramBindings(this.device,p.fragment.layout,this.textures);
  const [vertex,fragment]=await Promise.all([shaderModule(this.device,p.name+' vertex',p.vertex.code),shaderModule(this.device,p.name+' material '+p.mode,p.fragment.code)]);
  const program={...p,vertexDescriptor:p.vertex,vertex,fragment,vertexBindings,fragmentBindings,pipelines:new Map()};this.programs.set(p.key+':'+p.mode,program);this.programs.set(p.name+':'+p.mode,program);
 }));}
 program(material){if(!material)return null;const native=material.userData.webgpu?.kind;if(native)return this.programs.get(native+':3');if(material.isMeshStandardMaterial||material.isMeshBasicMaterial||material.isMeshLambertMaterial||material.isMeshPhongMaterial)return this.programs.get('standard:3');if(!material.vertexShader)return null;let key=this.materialKeys.get(material);if(!key){key=shaderKey(material.vertexShader);this.materialKeys.set(material,key);}return this.programs.get(key+':'+(material.defines?.MAT_MODE??3));}
 geometry(object,p){const g=object.geometry;let variants=this.geometryCache.get(g);if(!variants){variants=new Map();this.geometryCache.set(g,variants);const release=()=>{for(const [object,entries] of [...this.meshes])if(object.geometry===g)entries.release();for(const e of variants.values()){e.vertices?.destroy();e.indices?.destroy();}this.geometryCache.delete(g);g.removeEventListener('dispose',release);};variants.release=release;g.addEventListener('dispose',release);}
  // Attribute instancing belongs to geometry, while instance matrices belong to a mesh.
  const optimized=tuning(this.device).enabled,f=(optimized?cachedFields:fields)(p.vertexDescriptor.layout,object),key=optimized?f:JSON.stringify(f.map(a=>[a.name,a.inst]));let e=variants.get(key);const versions=f.filter(f=>!f.inst).map(f=>version(attribute(object,f.name))).join(',')+':'+version(g.index);
  if(!e||e.versions!==versions){e?.vertices?.destroy();e?.indices?.destroy();const vertexData=pack(object,f,false,g.attributes.position.count);const idx=g.index?.array;e={fields:f,layout:layouts(f),versions,vertices:vertexData.length?bufferWithData(this.device,'opaque vertices',vertexData,GPUBufferUsage.VERTEX):null,indices:idx?bufferWithData(this.device,'opaque indices',idx,GPUBufferUsage.INDEX):null,indexFormat:idx instanceof Uint16Array?'uint16':'uint32',count:idx?.length||g.attributes.position.count};e.layoutKey=JSON.stringify(e.layout);variants.set(key,e);}return e;
 }
 // (its instances packed again only when they or their layout change: not for another geometry variant of the same layout, as a craft's shadow and trunk maps draw it)
 mesh(object,p,g,material){let entries=this.meshes.get(object);if(!entries){entries=new Map();this.meshes.set(object,entries);const release=()=>{for(const e of entries.values()){e.cullRelease?.();e.instances?.destroy();e.p.vertexBindings.release(e);e.p.fragmentBindings.release(e);}this.meshes.delete(object);object.removeEventListener('dispose',release);};entries.release=release;object.addEventListener('dispose',release);}
  const key=p.name+':'+p.mode+':'+material.id;let e=entries.get(key);if(!e){e={p};entries.set(key,e);}const count=object.isInstancedMesh?object.count:object.geometry.isInstancedBufferGeometry?object.geometry.instanceCount:1;
  const versions=g.fields.filter(f=>f.inst).map(f=>version(attribute(object,f.name))).join(',')+':'+count;
  if(e.versions!==versions||e.fields!==g.fields){const data=pack(object,g.fields,true,count);if(data.length){if(!e.instances||e.bytes<data.byteLength){e.instances?.destroy();e.instances=this.device.createBuffer({label:'opaque instances',size:Math.max(4,data.byteLength),usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});e.bytes=data.byteLength;}this.device.queue.writeBuffer(e.instances,0,data);e.instanceRevision=(e.instanceRevision||0)+1;}e.versions=versions;e.fields=g.fields;}
  e.count=count;return e;
 }
 pipeline(p,g,material){const key=(tuning(this.device).enabled?g.layoutKey:JSON.stringify(g.layout))+':'+material.side;let pipeline=p.pipelines.get(key);if(!pipeline){pipeline=this.device.createRenderPipeline({label:p.name+' G-buffer',layout:this.device.createPipelineLayout({bindGroupLayouts:[p.vertexBindings.layout,p.fragmentBindings.layout]}),vertex:{module:p.vertex,entryPoint:'main',buffers:g.layout},fragment:{module:p.fragment,entryPoint:'main',targets:GBUFFER_FORMATS.map(format=>({format}))},primitive:{topology:'triangle-list',cullMode:material.side===THREE.DoubleSide?'none':material.side===THREE.BackSide?'front':'back',frontFace:'ccw'},depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'greater'}});p.pipelines.set(key,pipeline);}return pipeline;}
 // (stamp: the frame's G-buffer pass; a material's uniforms made once in it, but a standard material's,
 // which takes the object's own)
 prepare(object,material,body,projection,camera,stamp){const p=this.program(material);if(!p)return null;const g=this.geometry(object,p),e=this.mesh(object,p,g,material);if(!e.count)return null;
  const family=p.name==='standard'?(material.customProgramCacheKey?.().startsWith('interior')?5:4):FAMILY[p.name]||0;
  if(stamp!==undefined&&p.name!=='standard'&&p.name!=='survey'){
   const u=this.sharedUniforms(material,stamp,()=>({...material.uniforms,...material.userData.webgpu?.uniforms,...this.uniformOverrides,modelMatrix:{value:null},viewMatrix:{value:camera.matrixWorldInverse},projectionMatrix:{value:projection},uBodyIndex:{value:0}}));
   u.modelMatrix.value=object.matrixWorld;u.uBodyIndex.value=body*16+family;
   const k=this.sharedKey(p,material);
   return {p,g,e,pipeline:this.pipeline(p,g,material),vg:p.vertexBindings.get(e,u).group,fg:k?p.fragmentBindings.get(k,u,stamp).group:p.fragmentBindings.get(e,u).group,object};
  }
  const u={...material.uniforms,...material.userData.webgpu?.uniforms,...this.uniformOverrides,modelMatrix:{value:object.matrixWorld},viewMatrix:{value:camera.matrixWorldInverse},projectionMatrix:{value:projection},uBodyIndex:{value:body*16+family}};
  if(p.name==='standard'||p.name==='survey')Object.assign(u,this.standardUniforms(object,material));
  const vg=p.vertexBindings.get(e,u).group,fg=p.fragmentBindings.get(e,u).group;
  return {p,g,e,pipeline:this.pipeline(p,g,material),vg,fg,object};
 }
 standardUniforms(object,m){const maps=['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap','alphaMap'];const u={
  ...m.userData.livery,uLivery:{value:[m.userData.livery?1:0,object.geometry.attributes.color?.itemSize===4?1:0]},
  normalMatrix:{value:new THREE.Matrix3().getNormalMatrix(object.matrixWorld)},uUseColor:{value:m.vertexColors?1:0},
  uBase:{value:[m.color?.r??1,m.color?.g??1,m.color?.b??1,m.opacity??1]},
  uEmissive:{value:[(m.emissive?.r||0)*(m.emissiveIntensity??1),(m.emissive?.g||0)*(m.emissiveIntensity??1),(m.emissive?.b||0)*(m.emissiveIntensity??1)]},
  uPBR:{value:[m.roughness??0.8,m.metalness||0,m.alphaTest||0,m.aoMapIntensity??1]},
  uFlags:{value:[m.vertexColors?1:0,m.isMeshBasicMaterial?1:0,m.normalMap?.image?1:0,m.flatShading?1:0]},uNormalScale:{value:m.normalScale||[1,1]},
  uChannels:{value:maps.slice(0,4).map(k=>m[k]?.channel||0)},uChannels2:{value:maps.slice(4).map(k=>m[k]?.channel||0)},
 };for(const key of maps){const t=m[key]?.image?m[key]:this.white;if(t.matrixAutoUpdate)t.updateMatrix();u[key]={value:t};u[key+'Transform']={value:t.matrix};}return u;
 }
 // A pass's uniforms for a material, made once a pass (stamp): only the object's matrices change between
 // its draws. And its fragment bindings shared by those draws where its fragment stage reads nothing of the
 // object's (a material's water, a shadow's depth): packed once, not once a draw.
 sharedUniforms(material,stamp,make){const c=this.shared||(this.shared=new WeakMap());let s=c.get(material);if(!s||s.stamp!==stamp){s={stamp,u:make()};c.set(material,s);}return s.u;}
 sharedKey(p,material){if(p.fragmentShared===undefined)p.fragmentShared=!p.fragmentBindings.descriptor.uniforms.some(u=>/^(modelMatrix|modelViewMatrix|normalMatrix|uBodyIndex)$/.test(u.name));if(!p.fragmentShared)return null;const c=this.sharedKeys||(this.sharedKeys=new WeakMap());let k=c.get(material);if(!k){k={material};c.set(material,k);}return k;}
 // (state set only where it changes from the draw before, within this call)
 draw(pass,draw){let triangles=0,pipeline=null,vg=null,fg=null,vb=null;for(const d of draw){if(d.pipeline!==pipeline){pass.setPipeline(pipeline=d.pipeline);}if(d.vg!==vg)pass.setBindGroup(0,vg=d.vg);if(d.fg!==fg)pass.setBindGroup(1,fg=d.fg);if(d.g.vertices&&d.g.vertices!==vb)pass.setVertexBuffer(0,vb=d.g.vertices);if(d.e.instances)pass.setVertexBuffer(1,d.instanceBuffer||d.e.instances,d.instanceOffset||0,d.instanceSize);const range=d.object.geometry.drawRange,start=Math.max(range.start||0,d.group?.start||0),end=Math.min(d.g.count,(range.start||0)+range.count,(d.group?.start||0)+(d.group?.count??Infinity)),count=Math.max(0,end-start);if(d.g.indices){pass.setIndexBuffer(d.g.indices,d.g.indexFormat);if(d.indirect)pass.drawIndexedIndirect(d.indirect,d.indirectOffset||0);else pass.drawIndexed(count,d.e.count,start);}else if(d.indirect)pass.drawIndirect(d.indirect,d.indirectOffset||0);else pass.draw(count,d.e.count,start);triangles+=count*d.e.count/3;}return triangles;}
 dispose(){this.culler.dispose();for(const entries of [...this.meshes.values()])entries.release();for(const variants of [...this.geometryCache.values()])variants.release();for(const p of new Set(this.programs.values())){p.vertexBindings.dispose();p.fragmentBindings.dispose();}this.programs.clear();this.white.dispose();}
}
