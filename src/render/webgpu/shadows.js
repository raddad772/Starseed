// Reuse the existing cascade placement, update schedule and caster selection.
// This facade submits every atlas operation to WebGPU; no WebGL pixels are read.
import * as THREE from 'three';
import { SunShadows, SHADOW_LIGHT_UNIFORMS, SUN_SHADOW_UNIFORMS, SKY_SHADOW_UNIFORMS, SHADOW_LAYER } from '../sunShadows.js';
import { OpaquePass } from './opaque.js';
import { shadowPrograms } from './generated/shadows.js';
import { FULLSCREEN } from './shaders.js';
import { shaderModule, timestampWrites } from './device.js';

const CLEAR=FULLSCREEN+`
@group(0) @binding(0) var<uniform> color:vec4f;
@fragment fn clear() -> @location(0) vec4f { return color; }
`;
const COPY=FULLSCREEN+`
@group(0) @binding(0) var source:texture_2d<f32>;
@fragment fn copy(v:Fullscreen) -> @location(0) vec4f { return textureLoad(source,vec2i(v.uv*vec2f(textureDimensions(source))),0); }
`;
class ShadowGeometry extends OpaquePass {
  constructor(device,textures){super(device,textures,shadowPrograms);this.uniformOverrides={};}
  program(material,object){
    const a=object?.geometry.attributes;
    const name=a?.aBlade?'grassCover':a?.corner?'trunkSky':a?.rA?'rockShadow':a?.part?'floraShadow':'depth';
    return this.programs.get(name+':3');
  }
  pipeline(p,g,material){
    const additive=material.blending===THREE.CustomBlending;
    const key=g.layoutKey+':'+additive;
    let pipeline=p.pipelines.get(key);
    if(!pipeline){
      pipeline=this.device.createRenderPipeline({label:p.name,
        layout:this.device.createPipelineLayout({bindGroupLayouts:[p.vertexBindings.layout,p.fragmentBindings.layout]}),
        vertex:{module:p.vertex,entryPoint:'main',buffers:g.layout},
        fragment:{module:p.fragment,entryPoint:'main',targets:[{format:additive?'rgba16float':'r32float',...(additive?{blend:{color:{srcFactor:'one',dstFactor:'one',operation:'add'},alpha:{srcFactor:'one',dstFactor:'one',operation:'add'}}}:{})}]},
        primitive:{topology:'triangle-list',cullMode:'none'},
        ...(!additive?{depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'less-equal'}}:{}),
      });
      p.pipelines.set(key,pipeline);
    }
    return pipeline;
  }
  // (stamp: the map being drawn; a material's uniforms made once a map, the object's matrices set in them)
  prepare(object,material,camera,stamp){
    const p=this.program(material,object),g=this.geometry(object,p),e=this.mesh(object,p,g,material);
    if(!e.count)return null;
    const uniforms=this.sharedUniforms(material,stamp,()=>({...material.uniforms,...SHADOW_LIGHT_UNIFORMS,
      modelMatrix:{value:null},modelViewMatrix:{value:new THREE.Matrix4()},
      viewMatrix:{value:camera.matrixWorldInverse},projectionMatrix:{value:camera.projectionMatrix},
    }));
    uniforms.modelMatrix.value=object.matrixWorld;uniforms.modelViewMatrix.value.multiplyMatrices(camera.matrixWorldInverse,object.matrixWorld);
    const k=this.sharedKey(p,material);
    return {p,g,e,object,pipeline:this.pipeline(p,g,material),vg:p.vertexBindings.get(e,uniforms).group,fg:k?p.fragmentBindings.get(k,uniforms,stamp).group:p.fragmentBindings.get(e,uniforms).group};
  }
}
export class ShadowPass {
  constructor(device,textures,passes){
    this.device=device;this.textures=textures;this.passes=passes;
    this.geometry=new ShadowGeometry(device,textures);
    this.maps=new Map();this.temporary=new Map();this.clearColor=new THREE.Color(1,1,1);this.clearAlpha=1;
    this.current=null;this.extensions={has:()=>true,get:()=>true};this.frustum=new THREE.Frustum();this.matrix=new THREE.Matrix4();
  }
  async init(){
    await this.geometry.init();
    const d=this.device;
    const [clear,copy]=await Promise.all([shaderModule(d,'atlas clear',CLEAR),shaderModule(d,'coverage conversion',COPY)]);
    this.clearPipeline=d.createRenderPipeline({layout:'auto',vertex:{module:clear,entryPoint:'fullscreen'},fragment:{module:clear,entryPoint:'clear',targets:[{format:'r32float'}]},depthStencil:{format:'depth32float',depthWriteEnabled:false,depthCompare:'always'}});
    this.copyPipeline=d.createRenderPipeline({layout:'auto',vertex:{module:copy,entryPoint:'fullscreen'},fragment:{module:copy,entryPoint:'copy',targets:[{format:'r32float'}]}});
    this.clearBuffer=d.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    this.clearGroup=d.createBindGroup({layout:this.clearPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.clearBuffer}}]});
  }
  map(target){
    let e=this.maps.get(target);if(e)return e;
    const format=target.texture.type===THREE.FloatType?'r32float':'rgba16float';
    const mipLevelCount=target.texture.generateMipmaps?1+Math.floor(Math.log2(Math.max(target.width,target.height))):1;
    const texture=this.device.createTexture({label:'native shadow map',size:[target.width,target.height],format,mipLevelCount,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC});
    const depth=target.depthBuffer?this.device.createTexture({label:'shadow raster depth',size:[target.width,target.height],format:'depth32float',usage:GPUTextureUsage.RENDER_ATTACHMENT}):null;
    e={gpuEntry:true,texture,depth,format,mipLevelCount,width:target.width,height:target.height,view:texture.createView(),sampler:this.textures.sampler(target.texture)};
    this.maps.set(target,e);this.textures.renderTargets.set(target.texture,e);return e;
  }
  getRenderTarget(){return this.current;}
  setRenderTarget(target){this.current=target;if(target)this.map(target);}
  getClearColor(out){return out.copy(this.clearColor);}
  getClearAlpha(){return this.clearAlpha;}
  setClearColor(color,alpha=1){this.clearColor.set(color);this.clearAlpha=alpha;}
  region(pass,rect){pass.setViewport(rect.x,rect.y,rect.z,rect.w,0,1);pass.setScissorRect(rect.x,rect.y,rect.z,rect.w);}
  clear(){
    if(!this.current)return;
    const e=this.map(this.current),encoder=this.device.createCommandEncoder({label:'clear atlas region'});
    this.device.queue.writeBuffer(this.clearBuffer,0,new Float32Array([this.clearColor.r,this.clearColor.g,this.clearColor.b,this.clearAlpha]));
    const pass=encoder.beginRenderPass({timestampWrites:timestampWrites(this.device,'shadows'),colorAttachments:[{view:e.view,loadOp:'load',storeOp:'store'}],depthStencilAttachment:{view:e.depth.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});
    this.region(pass,this.current.viewport);pass.setPipeline(this.clearPipeline);pass.setBindGroup(0,this.clearGroup);pass.draw(3);pass.end();this.device.queue.submit([encoder.finish()]);
  }
  render(scene,camera){
    const target=this.current,e=this.map(target),first=scene.children[0]?.material;
    if(first===this.state.blurMat||first===this.state.ringMat){
      const name=first===this.state.blurMat?'skyblur':'skyrings';
      this.passes.draw(name,first,first.uniforms,[e],target.viewport);
      if(e.mipLevelCount>1)this.textures.generateMips(e.texture,e.format,e.mipLevelCount,1);
      return;
    }
    // (the frame's scene had its matrices brought up to date once, before its maps: not again for each)
    camera.updateMatrixWorld();if(scene!==this.fresh)scene.updateMatrixWorld();
    this.frustum.setFromProjectionMatrix(this.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    const draws=[];let additive=false;const stamp=this.stamp=(this.stamp||0)+1;
    scene.traverseVisible(object=>{
      if(!object.isMesh||(!object.layers.test(camera.layers)&&!(camera.layers.isEnabled(SHADOW_LAYER)&&object.castShadow)))return;
      if(object.frustumCulled&&!this.frustum.intersectsObject(object))return;
      const material=Array.isArray(object.material)?object.material[0]:object.material;
      additive ||= material.blending===THREE.CustomBlending;
      const draw=this.geometry.prepare(object,material,camera,stamp);if(draw)draws.push(draw);
    });
    let output=e,rect=target.viewport;
    if(additive){
      const key=rect.z+'x'+rect.w;output=this.temporary.get(key);
      if(!output){const texture=this.device.createTexture({label:'additive coverage',size:[rect.z,rect.w],format:'rgba16float',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});output={texture,view:texture.createView()};this.temporary.set(key,output);}
    }
    const encoder=this.device.createCommandEncoder({label:'shadow casters'});
    this.geometry.culler.encode(encoder,draws,this.frustum,camera);
    let pass=encoder.beginRenderPass({timestampWrites:timestampWrites(this.device,'shadows'),colorAttachments:[{view:output.view,loadOp:additive?'clear':'load',storeOp:'store',clearValue:[0,0,0,0]}],...(!additive?{depthStencilAttachment:{view:e.depth.createView(),depthLoadOp:'load',depthStoreOp:'store'}}:{})});
    if(!additive)this.region(pass,rect);
    this.geometry.draw(pass,draws);pass.end();
    if(additive){
      const group=this.device.createBindGroup({layout:this.copyPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:output.view}]});
      pass=encoder.beginRenderPass({timestampWrites:timestampWrites(this.device,'shadows'),colorAttachments:[{view:e.view,loadOp:'load',storeOp:'store'}]});this.region(pass,rect);pass.setPipeline(this.copyPipeline);pass.setBindGroup(0,group);pass.draw(3);pass.end();
    }
    this.device.queue.submit([encoder.finish()]);
  }
  // (scene: the frame's, its matrices already updated)
  update(source,scene){
    if(!source)return;
    if(!this.state)this.state=new SunShadows();
    const s=this.state;
    for(const key of ['on','sky','active','body'])s[key]=source[key];
    for(const key of ['sunDir','anchor','bodyQInv'])s[key].copy(source[key]);
    this.fresh=scene;try{s.render(this,scene);}finally{this.fresh=null;}
    // Allocate inactive outputs too: bindings may be evaluated before the first
    // active cascade, but their enable flags keep those zero-filled maps unused.
    this.map(s.atlas);this.map(s.skyRings);
  }
  get uniforms(){return {...SUN_SHADOW_UNIFORMS,...SKY_SHADOW_UNIFORMS};}
  dispose(){
    this.geometry.dispose();this.clearBuffer?.destroy();
    for(const [target,e] of this.maps){this.textures.renderTargets.delete(target.texture);e.texture.destroy();e.depth?.destroy();target.dispose();}
    for(const e of this.temporary.values())e.texture.destroy();
    if(this.state){for(const m of [this.state.mat,this.state.blurMat,this.state.ringMat,this.state.trunkMesh.material]){this.passes.names.get('skyblur')?.bindings.release(m);this.passes.names.get('skyrings')?.bindings.release(m);m.dispose();}this.state.trunkMesh.geometry.dispose();this.state.rockMesh.geometry.dispose();this.state.blurQuad.geometry.dispose();}
    this.maps.clear();this.temporary.clear();
  }
}
