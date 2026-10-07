import * as THREE from 'three';
import { bufferWithData, shaderModule } from './device.js';
import { ProgramBindings } from './program.js';
import { shaderKey } from './uniforms.js';
import { opaquePrograms } from './generated/opaque.js';
export const GBUFFER_FORMATS = ['rgba8unorm','rgba16float','rgba16float','rgba8unorm'];
const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const sizeOf=t=>Number(t.match(/vec(\d)/)?.[1]||1);
const version=a=>a?.isInterleavedBufferAttribute?a.data.version:a?.version||0;
const component=(a,i,k)=>a?.getComponent ? a.getComponent(i,k) : a?.[['getX','getY','getZ','getW'][k]]?.(i) ?? 0;
function attribute(object,name){if(name.startsWith('instance')&&/^instance[0-3]$/.test(name))return object.instanceMatrix;if(name==='instanceColor')return object.instanceColor;return object.geometry.attributes[name];}
function fields(layout,object){let vertex=0,instance=0;return layout.attributes.map(a=>{const source=attribute(object,a.name),inst=!!(a.name.startsWith('instance')||source?.isInstancedBufferAttribute);const n=sizeOf(a.type),offset=inst?instance:vertex;if(inst)instance+=n*4;else vertex+=n*4;return {...a,inst,n,offset};});}
function layouts(fields){return [false,true].map(inst=>{const a=fields.filter(f=>f.inst===inst);return {arrayStride:a.reduce((n,f)=>n+f.n*4,0),stepMode:inst?'instance':'vertex',attributes:a.map(f=>({shaderLocation:f.location,offset:f.offset,format:f.n===1?'float32':'float32x'+f.n}))};});}
function pack(object,fields,inst,count){const list=fields.filter(f=>f.inst===inst),stride=list.reduce((n,f)=>n+f.n,0),out=new Float32Array(count*stride);for(let i=0;i<count;i++)for(const f of list){const a=attribute(object,f.name),col=/^instance([0-3])$/.exec(f.name);for(let k=0;k<f.n;k++){
 let v;if(col){const c=Number(col[1])*4+k;v=a?a.array[i*16+c]:identity[c];}
 else if(a)v=k<a.itemSize?component(a,Math.floor(i/(a.meshPerAttribute||1)),k):(f.name==='color'&&k===3?1:0);
 else v=f.name==='instanceColor'||f.name==='color'?1:f.name==='normal'&&k===1?1:0;
 out[i*stride+f.offset/4+k]=v;
 }}return out;}
const disabledShadows={uSunShadow:{value:null},uSkyShadow:{value:null},uGrassCover:{value:null},uTrunkSky:{value:null},uRockSky:{value:null},tShadowAtlas:{value:null},tSkyRings:{value:null}};
export class OpaquePass {
 constructor(device,textures){this.device=device;this.textures=textures;this.programs=new Map();this.materialKeys=new WeakMap();this.meshes=new Map();this.geometryCache=new Map();this.white=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);this.white.needsUpdate=true;}
 async init(){await Promise.all(opaquePrograms.map(async p=>{
  const vertexBindings=new ProgramBindings(this.device,p.vertex.layout,this.textures,GPUShaderStage.VERTEX),fragmentBindings=new ProgramBindings(this.device,p.fragment.layout,this.textures);
  const [vertex,fragment]=await Promise.all([shaderModule(this.device,p.name+' vertex',p.vertex.code),shaderModule(this.device,p.name+' material '+p.mode,p.fragment.code)]);
  const program={...p,vertexDescriptor:p.vertex,vertex,fragment,vertexBindings,fragmentBindings,pipelines:new Map()};this.programs.set(p.key+':'+p.mode,program);this.programs.set(p.name+':'+p.mode,program);
 }));}
 program(material){if(!material)return null;const native=material.userData.webgpu?.kind;if(native)return this.programs.get(native+':3');if(material.isMeshStandardMaterial||material.isMeshBasicMaterial||material.isMeshLambertMaterial||material.isMeshPhongMaterial)return this.programs.get('standard:3');if(!material.vertexShader)return null;let key=this.materialKeys.get(material);if(!key){key=shaderKey(material.vertexShader);this.materialKeys.set(material,key);}return this.programs.get(key+':'+(material.defines?.MAT_MODE??3));}
 geometry(object,p){const g=object.geometry;let variants=this.geometryCache.get(g);if(!variants){variants=new Map();this.geometryCache.set(g,variants);const release=()=>{for(const [object,entries] of [...this.meshes])if(object.geometry===g)entries.release();for(const e of variants.values()){e.vertices?.destroy();e.indices?.destroy();}this.geometryCache.delete(g);g.removeEventListener('dispose',release);};variants.release=release;g.addEventListener('dispose',release);}
  // Attribute instancing belongs to geometry, while instance matrices belong to a mesh.
  const f=fields(p.vertexDescriptor.layout,object),key=JSON.stringify(f.map(a=>[a.name,a.inst]));let e=variants.get(key);const versions=f.filter(f=>!f.inst).map(f=>version(attribute(object,f.name))).join(',')+':'+version(g.index);
  if(!e||e.versions!==versions){e?.vertices?.destroy();e?.indices?.destroy();const vertexData=pack(object,f,false,g.attributes.position.count);const idx=g.index?.array;e={fields:f,layout:layouts(f),versions,vertices:vertexData.length?bufferWithData(this.device,'opaque vertices',vertexData,GPUBufferUsage.VERTEX):null,indices:idx?bufferWithData(this.device,'opaque indices',idx,GPUBufferUsage.INDEX):null,indexFormat:idx instanceof Uint16Array?'uint16':'uint32',count:idx?.length||g.attributes.position.count};variants.set(key,e);}return e;
 }
 mesh(object,p,g,material){let entries=this.meshes.get(object);if(!entries){entries=new Map();this.meshes.set(object,entries);const release=()=>{for(const e of entries.values()){e.instances?.destroy();e.p.vertexBindings.release(e);e.p.fragmentBindings.release(e);}this.meshes.delete(object);object.removeEventListener('dispose',release);};entries.release=release;object.addEventListener('dispose',release);}
  const key=p.name+':'+p.mode+':'+material.id;let e=entries.get(key);if(!e){e={p};entries.set(key,e);}const count=object.isInstancedMesh?object.count:object.geometry.isInstancedBufferGeometry?object.geometry.instanceCount:1;
  const versions=g.fields.filter(f=>f.inst).map(f=>version(attribute(object,f.name))).join(',')+':'+count;
  if(e.versions!==versions||e.geometry!==g){const data=pack(object,g.fields,true,count);if(data.length){if(!e.instances||e.bytes<data.byteLength){e.instances?.destroy();e.instances=this.device.createBuffer({label:'opaque instances',size:Math.max(4,data.byteLength),usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.bytes=data.byteLength;}this.device.queue.writeBuffer(e.instances,0,data);}e.versions=versions;e.geometry=g;}
  e.count=count;return e;
 }
 pipeline(p,g,material){const key=JSON.stringify(g.layout)+':'+material.side;let pipeline=p.pipelines.get(key);if(!pipeline){pipeline=this.device.createRenderPipeline({label:p.name+' G-buffer',layout:this.device.createPipelineLayout({bindGroupLayouts:[p.vertexBindings.layout,p.fragmentBindings.layout]}),vertex:{module:p.vertex,entryPoint:'main',buffers:g.layout},fragment:{module:p.fragment,entryPoint:'main',targets:GBUFFER_FORMATS.map(format=>({format}))},primitive:{topology:'triangle-list',cullMode:material.side===THREE.DoubleSide?'none':material.side===THREE.BackSide?'front':'back',frontFace:'ccw'},depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'greater'}});p.pipelines.set(key,pipeline);}return pipeline;}
 prepare(object,material,body,projection,camera){const p=this.program(material);if(!p)return null;const g=this.geometry(object,p),e=this.mesh(object,p,g,material);if(!e.count)return null;
  const family={rock:1,flora:2,grass:3,standard:4,floe:6,iceblock:6}[p.name]||0;
  const u={...material.uniforms,...material.userData.webgpu?.uniforms,...disabledShadows,modelMatrix:{value:object.matrixWorld},viewMatrix:{value:camera.matrixWorldInverse},projectionMatrix:{value:projection},uBodyIndex:{value:body*16+family}};
  if(p.name==='standard')Object.assign(u,this.standardUniforms(object,material));
  const vg=p.vertexBindings.get(e,u).group,fg=p.fragmentBindings.get(e,u).group;
  return {p,g,e,pipeline:this.pipeline(p,g,material),vg,fg,object};
 }
 standardUniforms(object,m){const maps=['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap','alphaMap'];const u={
  normalMatrix:{value:new THREE.Matrix3().getNormalMatrix(object.matrixWorld)},uUseColor:{value:m.vertexColors?1:0},
  uBase:{value:[m.color?.r??1,m.color?.g??1,m.color?.b??1,m.opacity??1]},
  uEmissive:{value:[(m.emissive?.r||0)*(m.emissiveIntensity??1),(m.emissive?.g||0)*(m.emissiveIntensity??1),(m.emissive?.b||0)*(m.emissiveIntensity??1)]},
  uPBR:{value:[m.roughness??0.8,m.metalness||0,m.alphaTest||0,m.aoMapIntensity??1]},
  uFlags:{value:[m.vertexColors?1:0,m.isMeshBasicMaterial?1:0,m.normalMap?.image?1:0,m.flatShading?1:0]},uNormalScale:{value:m.normalScale||[1,1]},
  uChannels:{value:maps.slice(0,4).map(k=>m[k]?.channel||0)},uChannels2:{value:maps.slice(4).map(k=>m[k]?.channel||0)},
 };for(const key of maps){const t=m[key]?.image?m[key]:this.white;if(t.matrixAutoUpdate)t.updateMatrix();u[key]={value:t};u[key+'Transform']={value:t.matrix};}return u;
 }
 draw(pass,draw){let triangles=0;for(const d of draw){pass.setPipeline(d.pipeline);pass.setBindGroup(0,d.vg);pass.setBindGroup(1,d.fg);if(d.g.vertices)pass.setVertexBuffer(0,d.g.vertices);if(d.e.instances)pass.setVertexBuffer(1,d.e.instances);const range=d.object.geometry.drawRange,start=range.start||0,count=Math.max(0,Math.min(d.g.count-start,range.count));if(d.g.indices){pass.setIndexBuffer(d.g.indices,d.g.indexFormat);pass.drawIndexed(count,d.e.count,start);}else pass.draw(count,d.e.count,start);triangles+=count*d.e.count/3;}return triangles;}
 dispose(){for(const entries of [...this.meshes.values()])entries.release();for(const variants of [...this.geometryCache.values()])variants.release();for(const p of new Set(this.programs.values())){p.vertexBindings.dispose();p.fragmentBindings.dispose();}this.programs.clear();this.white.dispose();}
}
