import { timestampWrites } from './device.js';
import * as THREE from 'three';
import { OpaquePass } from './opaque.js';
import { shaderKey } from './uniforms.js';
import * as standardVertex from './generated/standardVertex.js';
import * as standardForwardFragment from './generated/standardForwardFragment.js';
import * as starVertex from './generated/starVertex.js';
import * as starFragment from './generated/starFragment.js';
import { forwardPrograms } from './generated/forward.js';

// Liquids sample a stable copy of the lit opaque scene. Effects keep their
// original blending and depth policy, with reversed-Z shared by every pass.
export class ForwardPass extends OpaquePass {
  constructor(device,textures,localLights){super(device,textures,[...forwardPrograms,{name:'standardForward',key:'standardForward',mode:3,vertex:standardVertex,fragment:standardForwardFragment},{name:'stars',key:'stars',mode:3,vertex:starVertex,fragment:starFragment}]);this.uniformOverrides={};this.starMeshes=new Map();this.localLights=localLights;}
  program(material){
    if(material?.userData.webgpu?.kind==='stars')return this.programs.get('stars:3');
    if(material?.isMeshStandardMaterial||material?.isMeshBasicMaterial||material?.isMeshPhongMaterial||material?.isMeshLambertMaterial)return this.programs.get('standardForward:3');
    if(!material?.vertexShader)return null;
    let key=this.materialKeys.get(material);
    if(!key){key=shaderKey(material.vertexShader)+':'+shaderKey(material.fragmentShader);this.materialKeys.set(material,key);}
    return this.programs.get(key+':3');
  }
  pipeline(p,g,m){
    const liquid=p.name==='water'||p.name==='ribbon';
    const additive=m.blending===THREE.AdditiveBlending;
    const premult=m.premultipliedAlpha||m.blendSrc===THREE.OneFactor;
    const blend=!liquid&&m.transparent?{color:{operation:'add',srcFactor:premult?'one':'src-alpha',dstFactor:additive?'one':'one-minus-src-alpha'},alpha:{operation:'add',srcFactor:'one',dstFactor:additive?'one':'one-minus-src-alpha'}}:undefined;
    const key=JSON.stringify([g.layout,m.side,m.depthTest,m.depthWrite,blend]);
    let pipeline=p.pipelines.get(key);
    if(!pipeline){pipeline=this.device.createRenderPipeline({label:p.name+' forward',layout:this.device.createPipelineLayout({bindGroupLayouts:[p.vertexBindings.layout,p.fragmentBindings.layout,...(p.name==='standardForward'?[this.localLights.shadeLayout]:[])]}),vertex:{module:p.vertex,entryPoint:'main',buffers:g.layout},fragment:{module:p.fragment,entryPoint:'main',targets:[{format:'rgba16float',blend}]},primitive:{topology:'triangle-list',cullMode:m.side===THREE.DoubleSide?'none':m.side===THREE.BackSide?'front':'back'},depthStencil:{format:'depth32float',depthWriteEnabled:liquid||m.depthWrite,depthCompare:m.depthTest===false?'always':'greater-equal',depthBias:m.polygonOffset?-(m.polygonOffsetUnits||0):0,depthBiasSlopeScale:m.polygonOffset?-(m.polygonOffsetFactor||0):0}});p.pipelines.set(key,pipeline);}
    return pipeline;
  }
  prepare(object,material,projection,camera,uniforms){
    const p=this.program(material);if(!p)return null;
    const g=this.geometry(object,p),e=this.mesh(object,p,g,material);if(!e.count)return null;
    const u={...material.uniforms,...this.uniformOverrides,...uniforms,modelMatrix:{value:object.matrixWorld},modelViewMatrix:{value:new THREE.Matrix4().multiplyMatrices(camera.matrixWorldInverse,object.matrixWorld)},viewMatrix:{value:camera.matrixWorldInverse},projectionMatrix:{value:projection}};
    if(p.name==='standardForward'){
      let body=this.bodyLights?.[0]||{},distance=Infinity;const point=new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
      for(const light of this.bodyLights||[]){const d=point.distanceTo(light.uCenter.value)-(light.uRadius?.value||0);if(d<distance){body=light;distance=d;}}
      Object.assign(u,body,this.standardUniforms(object,material),this.uniformOverrides,{uInterior:{value:material.customProgramCacheKey?.().startsWith('interior')?1:0},uCanopy:{value:material.userData.webgpuCanopy?1:0}});
    }
    if(!u.tCloudShadow?.value?.userData?.webgpuRecipe){u.tCloudShadow={value:null};u.uCSOn={value:0};}
    return {p,g,e,object,pipeline:this.pipeline(p,g,material),vg:p.vertexBindings.get(e,u).group,fg:p.fragmentBindings.get(e,u).group};
  }
  draw(pass,draws){let n=0;for(const d of draws){if(d.p.name==='standardForward')pass.setBindGroup(2,this.clusterGroup);n+=super.draw(pass,[d]);}return n;}
  collect(scene,camera,projection,frustum,uniforms,predicate=()=>true){
    const draws=[];if(!scene)return draws;
    scene.traverseVisible(object=>{
      if(!object.isMesh||!object.layers.test(camera.layers)||(object.frustumCulled&&!frustum.intersectsObject(object)))return;
      const materials=Array.isArray(object.material)?object.geometry.groups.map(group=>({material:object.material[group.materialIndex],group})):[{material:object.material}];
      for(const {material,group} of materials){if(!material?.visible||!predicate(material,object))continue;const d=this.prepare(object,material,projection,camera,uniforms);if(d){d.group=group;d.order=object.renderOrder;d.distance=object.getWorldPosition(new THREE.Vector3()).distanceToSquared(camera.position);draws.push(d);}}
    });
    return draws.sort((a,b)=>a.order-b.order||b.distance-a.distance);
  }
  render(draws,t,output=t.hdr){
    if(!draws.length)return 0;
    const encoder=this.device.createCommandEncoder({label:'forward surfaces'}),pass=encoder.beginRenderPass({timestampWrites:timestampWrites(this.device,'forward surfaces'),colorAttachments:[{view:output.createView(),loadOp:'load',storeOp:'store'}],depthStencilAttachment:{view:t.depth.createView(),depthLoadOp:'load',depthStoreOp:'store'}});
    const triangles=this.draw(pass,draws);pass.end();this.device.queue.submit([encoder.finish()]);return triangles;
  }
  liquids(engine,t,projection,frustum,air){
    air.copyDepth(t);
    if(!t.opaqueCopy){const texture=this.device.createTexture({label:'opaque refraction image',size:[t.width,t.height],format:'rgba16float',usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.TEXTURE_BINDING});t.textures.push(texture);t.opaqueCopy=air.entry(texture);}
    const encoder=this.device.createCommandEncoder();encoder.copyTextureToTexture({texture:t.hdr},{texture:t.opaqueCopy.texture},[t.width,t.height]);this.device.queue.submit([encoder.finish()]);
    const camera=engine.view.camera,u={tOpaque:{value:t.opaqueCopy},tWaterDepth:{value:t.sampledDepth},uZMode:{value:0},uZNear:{value:camera.near},uZFar:{value:camera.far},uZLogFC:{value:Math.log2(camera.far+1)}};
    const draws=this.collect(engine.scene,camera,projection,frustum,u,m=>m.transparent||this.program(m)?.name==='water');
    if(engine.waterScene&&engine.syncOwned(engine.waterScene))draws.push(...this.collect(engine.waterScene,camera,projection,frustum,u));
    return this.render(draws,t);
  }
  stars(engine,t,projection){
    const sky=engine.frameInputs?.sky,points=sky?.points;if(!points?.visible)return;
    let mesh=this.starMeshes.get(points);
    if(!mesh){
      const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(18),3));g.setAttribute('corner',new THREE.Float32BufferAttribute([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1],2));
      for(const [name,original] of [['aStar','position'],['aColor','color'],['aSize','size']]){const a=points.geometry.attributes[original];g.setAttribute(name,new THREE.InstancedBufferAttribute(a.array,a.itemSize));}
      g.instanceCount=points.geometry.attributes.position.count;
      const m=points.material.clone();m.userData.webgpu={kind:'stars'};mesh=new THREE.Mesh(g,m);this.starMeshes.set(points,mesh);
      mesh.release=()=>{g.dispose();m.dispose();this.starMeshes.delete(points);points.geometry.removeEventListener('dispose',mesh.release);};points.geometry.addEventListener('dispose',mesh.release);
    }
    mesh.matrixWorld.copy(points.matrixWorld);mesh.material.uniforms=points.material.uniforms;
    const adapt=t.post?.adapt[t.post.idx];
    this.render([this.prepare(mesh,mesh.material,projection,engine.view.camera,{uViewport:{value:[t.width,t.height]},tAdapt:{value:adapt||null}})],t);
  }
  dispose(){for(const mesh of [...this.starMeshes.values()])mesh.release();super.dispose();}
  effects(engine,t,output,projection,frustum){
    const camera=engine.view.camera,u={tSceneDepth:{value:t.sampledDepth},uDepthMode:{value:0},uNear:{value:camera.near},uFar:{value:camera.far},uLogDepthFC:{value:Math.log2(camera.far+1)},uPixH:{value:t.height}};
    let count=0;
    if(engine.softScene&&engine.syncOwned(engine.softScene))count+=this.render(this.collect(engine.softScene,camera,projection,frustum,u),t,output);
    if(engine.transparentScene){engine.transparentScene.updateMatrixWorld();count+=this.render(this.collect(engine.transparentScene,camera,projection,frustum,u),t,output);}
    return count;
  }
}
